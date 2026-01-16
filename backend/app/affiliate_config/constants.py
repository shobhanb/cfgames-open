MASTERS_AGE_CUTOFF = 55
OPEN_AGE_CUTOFF = 35
U18_AGE_CUTOFF = 17

AFFILIATE_CONFIG_DEFAULTS = [
    {
        "affiliate_id": 31316,
        "year": 2026,
        "participation_score": 1,
        "top3_score": 3,
        "judge_score": 2,
        "attendance_score": 2,
        "appreciation_score": 15,
        "rookie_score": 15,
        "side_challenge_score": 30,
        "spirit_score": 20,
        "use_scheduling": True,
        "use_appreciation": True,
    },
    {
        "affiliate_id": 31316,
        "year": 2025,
        "participation_score": 1,
        "top3_score": 3,
        "judge_score": 2,
        "attendance_score": 2,
        "appreciation_score": 10,
        "rookie_score": 0,
        "side_challenge_score": 25,
        "spirit_score": 25,
        "use_scheduling": True,
        "use_appreciation": True,
    },
]

# Legacy constants for backward compatibility
PARTICIPATION_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["participation_score"]
TOP3_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["top3_score"]
JUDGE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["judge_score"]
ATTENDANCE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["attendance_score"]
DEFAULT_APPRECIATION_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["appreciation_score"]
DEFAULT_ROOKIE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["rookie_score"]
DEFAULT_SIDE_CHALLENGE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["side_challenge_score"]
DEFAULT_SPIRIT_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["spirit_score"]
