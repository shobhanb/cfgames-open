-- SQLite

update athlete 
set team_name = query.team_name
from (
    select * from team_names_2024
) as query
where lower(athlete.name) = lower(query.name) and athlete.year = 2024 and athlete.affiliate_id = 31316
;
