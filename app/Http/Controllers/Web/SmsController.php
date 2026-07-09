<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Sms\SmsMessageModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    public function index(Request $request): Response
    {
        $messages = SmsMessageModel::where('tenant_id', $request->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Sms/Index', [
            'messages' => $messages,
        ]);
    }
}
