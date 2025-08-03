# Constants for CF Open MF model
CF_LEADERBOARD_URL = "https://c3po.crossfit.com/api/leaderboards/v2/competitions/open/YYYY/leaderboards"


YEAR = 2025
AFFILIATE_ID = 31316
EVENT_NAMES = {
    1: "25.1",
    2: "25.2",
    3: "25.3",
}


TEAM_ROLE_MAP = {
    "TL": 2,
    "C": 1,
}
TEAM_ROLE_REVERSE_MAP = {v: k for k, v in TEAM_ROLE_MAP.items()}


MASTERS_AGE_CUTOFF = 55
OPEN_AGE_CUTOFF = 35
PARTICIPATION_SCORE = 1
TOP3_SCORE = 3
JUDGE_SCORE = 2
ATTENDANCE_SCORE = 2
DEFAULT_APPRECIATION_SCORE = 10
DEFAULT_SIDE_SCORE = 25

DEFAULT_TEAM_NAME = "zz"
IGNORE_TEAMS = [
    "Short-put Bai-kar",
]

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
HTTPX_TIMEOUT = 10
HTTPX_MAX_RATE_LIMIT_PER_SECOND = 5
