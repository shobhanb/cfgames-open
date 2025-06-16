-- SQLite

update athlete 
set team_name = query.name
from (
    select * from team_names
) as query
where athlete.competitor_id = query.competitor_id and athlete.year = 2025
;
