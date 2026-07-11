<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('activitylog:clean')->weekly();
Schedule::command('data:purge-expired')->daily()->at('03:00');
