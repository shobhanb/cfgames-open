from __future__ import annotations

import asyncio
import logging
import time

from httpx import AsyncClient, HTTPError
from httpx_limiter.async_rate_limited_transport import AsyncRateLimitedTransport
from httpx_limiter.rate import Rate
from pydantic_settings import BaseSettings

CF_LEADERBOARD_URL = "https://c3po.crossfit.com/api/leaderboards/v2/competitions/open/YYYY/leaderboards"
CF_DIVISION_MAP = {
    "1": "Men Open",
    "2": "Women Open",
    "14": "Men 14-15",
    "15": "Women 14-15",
    "16": "Men 16-17",
    "17": "Women 16-17",
    "7": "Men 55-59",
    "8": "Women 55-59",
    "36": "Men 60-64",
    "37": "Women 60-64",
    "40": "Men 65-69",
    "41": "Women 65-69",
    "42": "Men 70+",
    "43": "Women 70+",
}

# Throttle requests
HTTPX_TIMEOUT = 20
HTTPX_MAX_RATE_LIMIT_PER_SECOND = 1

log = logging.getLogger(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


class Settings(BaseSettings):
    affiliate_code: int = 31316
    year: int = 2026
    backend_url: str = "http://localhost:8000"
    endpoint: str = "cfgames/apikey-manual-refresh"
    api_key: str = "secret"


settings = Settings()


async def cf_data_api(  # noqa: PLR0913
    httpx_client: AsyncClient,
    api_url: str,
    affiliate_code: int,
    division: int,
    entrant_list: list[dict],
    scores_list: list[list[dict]],
) -> None:
    total_pages = 1
    page = 1

    log.info(
        "Fetching CF data for affiliate %s, division %s",
        affiliate_code,
        division,
    )

    while True:
        params = {"affiliate": affiliate_code, "page": page, "per_page": 100, "view": 0, "division": division}

        try:
            response = await httpx_client.get(url=api_url, params=params)
            response.raise_for_status()

            log.info(
                "Successfully fetched page %s for affiliate %s, division %s (status: %s)",
                page,
                affiliate_code,
                division,
                response.status_code,
            )

        except HTTPError:
            log.exception(
                "HTTP error fetching CF data for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise
        except Exception:
            log.exception(
                "Unexpected error fetching CF data for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise

        try:
            json_response = response.json()
        except Exception:
            log.exception(
                "Error parsing JSON response for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise

        try:
            leaderboard_list = json_response.get("leaderboardRows", [])
            entrants = [x.get("entrant") for x in leaderboard_list]
            entrant_list.extend(entrants)
            scores = [x.get("scores", []) for x in leaderboard_list]
            # Filter out None values and convert to empty list if needed
            scores = [s if s is not None else [] for s in scores]
            scores_list.extend(scores)

            log.info(
                "Processed %s entrants from page %s for affiliate %s, division %s",
                len(entrants),
                page,
                affiliate_code,
                division,
            )

            # Handle pagination
            total_pages = json_response.get("pagination", {}).get("totalPages", 1)
            if total_pages <= page:
                log.info(
                    "Completed fetching all %s pages for affiliate %s, division %s (%s total entrants)",
                    total_pages,
                    affiliate_code,
                    division,
                    len(entrants),
                )
                break

            page += 1

        except Exception:
            log.exception(
                "Error processing response data for affiliate %s, division %s, page %s",
                affiliate_code,
                division,
                page,
            )
            raise


async def get_cf_data(affiliate_code: int, year: int) -> tuple[list[dict], list[list[dict]]]:
    """Get CF leaderboard data."""
    log.info("Getting CF Leaderboard data for year %s affiliate code %s", year, affiliate_code)
    entrant_list = []
    scores_list = []

    api_url = CF_LEADERBOARD_URL.replace("YYYY", str(year))
    transport = AsyncRateLimitedTransport.create(
        rate=Rate.create(magnitude=1, duration=1 / HTTPX_MAX_RATE_LIMIT_PER_SECOND),
    )

    start_time = time.time()
    try:
        async with AsyncClient(transport=transport, timeout=HTTPX_TIMEOUT) as aclient:
            await asyncio.gather(
                *[
                    cf_data_api(
                        httpx_client=aclient,
                        api_url=api_url,
                        affiliate_code=affiliate_code,
                        division=int(x),
                        entrant_list=entrant_list,
                        scores_list=scores_list,
                    )
                    for x in CF_DIVISION_MAP
                ],
            )

    except HTTPError:
        log.warning("HTTP Exception while getting CF data")
        raise

    end_time = time.time()

    log.info("Downloaded %s entrants, %s scores", len(entrant_list), len(scores_list))
    log.info("Time taken: %s", (end_time - start_time))
    return entrant_list, scores_list


async def run_manual_refresh() -> None:
    """Run a manual refresh of the CF Games data."""
    start_time = time.time()
    entrant_list, scores_list = await get_cf_data(affiliate_code=settings.affiliate_code, year=settings.year)
    end_time = time.time()
    log.info("Manual refresh completed in %.2f seconds", end_time - start_time)
    log.info("Fetched %d entrants and %d scores", len(entrant_list), len(scores_list))

    transport = AsyncRateLimitedTransport.create(
        rate=Rate.create(magnitude=1, duration=1 / HTTPX_MAX_RATE_LIMIT_PER_SECOND),
    )
    async with AsyncClient(transport=transport, timeout=HTTPX_TIMEOUT) as aclient:
        response = await aclient.get(
            f"{settings.backend_url}/health",
        )
        response.raise_for_status()
        log.info("Health check API response status: %s", response.status_code)

        params = {
            "affiliate_id": settings.affiliate_code,
            "year": settings.year,
        }
        json = {
            "entrant_list": entrant_list,
            "scores_list": scores_list,
        }

        response = await aclient.post(
            f"{settings.backend_url}/{settings.endpoint}",
            headers={"X-API-KEY": settings.api_key},
            params=params,
            json=json,
        )
        log.info(response.text)
        log.info("Manual refresh API response status: %s", response.status_code)
        log.info("Manual refresh API response data: %s", response.json())
        response.raise_for_status()


if __name__ == "__main__":
    asyncio.run(run_manual_refresh())
