-- SQLite

update athlete 
set team_name = query.team_name,
team_role = query.team_role
from (
    select * from team_names_2025
) as query
where athlete.crossfit_id = query.crossfit_id and athlete.year = 2025
;
