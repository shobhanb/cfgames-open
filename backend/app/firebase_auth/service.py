from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.athlete.models import Athlete

from .models import FirebaseUser


async def get_db_athletes_not_signed_up(
    db_session: AsyncSession,
    affiliate_id: int,
    year: int,
) -> list[Athlete]:
    """Get athletes for a given affiliate and year who haven't signed up in Firebase."""
    # Get all athletes for the affiliate and year
    athletes_query = select(Athlete).where(
        Athlete.affiliate_id == affiliate_id,
        Athlete.year == year,
    )
    athletes_result = await db_session.execute(athletes_query)
    athletes = list(athletes_result.scalars().all())

    # Get all crossfit_ids from Firebase users
    firebase_users_query = select(FirebaseUser.crossfit_id)
    firebase_result = await db_session.execute(firebase_users_query)
    signed_up_crossfit_ids = set(firebase_result.scalars().all())

    # Filter athletes who haven't signed up
    return [athlete for athlete in athletes if athlete.crossfit_id not in signed_up_crossfit_ids]
