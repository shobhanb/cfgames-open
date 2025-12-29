MASTERS_AGE_CUTOFF = 55
OPEN_AGE_CUTOFF = 35

AFFILIATE_CONFIG_DEFAULTS = [
    {
        "affiliate_id": 31316,
        "year": 2026,
        "participation_score": 1,
        "top3_score": 3,
        "judge_score": 2,
        "attendance_score": 2,
        "default_appreciation_score": 10,
        "default_side_score": 25,
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
        "default_appreciation_score": 10,
        "default_side_score": 25,
        "use_scheduling": True,
        "use_appreciation": True,
    },
]

# Legacy constants for backward compatibility
PARTICIPATION_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["participation_score"]
TOP3_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["top3_score"]
JUDGE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["judge_score"]
ATTENDANCE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["attendance_score"]
DEFAULT_APPRECIATION_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["default_appreciation_score"]
DEFAULT_SIDE_SCORE = AFFILIATE_CONFIG_DEFAULTS[0]["default_side_score"]
