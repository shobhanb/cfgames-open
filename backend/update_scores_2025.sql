UPDATE score
SET
    participation_score = s.participation_score,
    top3_score = s.top3_score,
    judge_score = s.judge_score,
    attendance_score = s.attendance_score,
    appreciation_score = s.appreciation_score,
    side_challenge_score = s.side_challenge_score,
    spirit_score = s.spirit_score,
    total_individual_score = s.participation_score + s.top3_score + s.judge_score + s.attendance_score + s.appreciation_score ,
    total_team_score = s.participation_score + s.top3_score + s.judge_score + s.attendance_score + s.appreciation_score + s.side_challenge_score + s.spirit_score
FROM (select * from scores_2025) as s
WHERE
    score.crossfit_id = s.crossfit_id
    AND score.year = s.year
    AND score.ordinal = s.ordinal

;
