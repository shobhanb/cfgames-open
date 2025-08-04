UPDATE score
SET
    attendance_score = 0,
    judge_score = 0,
    side_challenge_score = 0,
    spirit_score = 0
WHERE score.year = 2024
;

UPDATE score
SET
    attendance_score = s."24_1_attendance_score" * 1,
    judge_score = 0,
    side_challenge_score = s."24_1_team_name_&_logo_score" + s."24_1_team_wod_prediction_score",
    spirit_score = s."24_1_spirit_of_the_open_score" * 1
FROM (
select  athlete.crossfit_id, scores_2024.*
from scores_2024 left join athlete on lower(scores_2024.name) = lower(athlete.name) and athlete.year = 2024 and athlete.affiliate_id = 31316
) as s
WHERE s.crossfit_id = score.crossfit_id and score.year = 2024
and score.ordinal = 1
;

UPDATE score
SET
    attendance_score = s."24.2_attendance_score" * 1,
    judge_score = 0,
    side_challenge_score = s."24.2_team_gauntlet__score" * 1 ,
    spirit_score = s."24.2_spirit_of_the_open_score" * 1
FROM (
select  athlete.crossfit_id, scores_2024.*
from scores_2024 left join athlete on lower(scores_2024.name) = lower(athlete.name) and athlete.year = 2024 and athlete.affiliate_id = 31316
) as s
WHERE s.crossfit_id = score.crossfit_id and score.year = 2024
and score.ordinal = 2
;

UPDATE score
SET
    attendance_score = s."24.3_attendance_score" * 1,
    judge_score = 0,
    side_challenge_score = s."24.3_team_gauntlet_score" * 1 ,
    spirit_score = s."24.3_spirit_of_the_open_score" * 1
FROM (
select  athlete.crossfit_id, scores_2024.*
from scores_2024 left join athlete on lower(scores_2024.name) = lower(athlete.name) and athlete.year = 2024 and athlete.affiliate_id = 31316
) as s
WHERE s.crossfit_id = score.crossfit_id and score.year = 2024
and score.ordinal = 3
;

UPDATE score
SET
    total_individual_score = participation_score + top3_score + judge_score + attendance_score + appreciation_score ,
    total_team_score = participation_score + top3_score + judge_score + attendance_score + appreciation_score + side_challenge_score + spirit_score
WHERE score.year = 2024
;