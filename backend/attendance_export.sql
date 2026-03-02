select ha.athlete_name, ha.athlete_crossfit_id, h.short_name, h.start_time, fu.email 
from heat_assignments ha
left join heats h on ha.heat_id = h.id
left join firebase_user fu
on ha.athlete_crossfit_id = fu.crossfit_id 
where h.year = 2026
and h.affiliate_id = 31316
and h.ordinal = 1
order by h.start_time