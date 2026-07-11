<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DataDeletionController extends Controller
{
    public function destroy(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        if (! $request->user()->isOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $deletedCalls = DB::table('calls')
            ->where('tenant_id', $tenantId)
            ->delete();

        $deletedRecordings = 0;

        if (Storage::disk('recordings')->exists((string) $tenantId)) {
            $recordingFiles = Storage::disk('recordings')->files((string) $tenantId);

            foreach ($recordingFiles as $file) {
                Storage::disk('recordings')->delete($file);
                $deletedRecordings++;
            }
        }

        User::where('tenant_id', $tenantId)->each(function (User $user) {
            $user->update([
                'name' => 'Deleted User',
                'email' => 'deleted-'.$user->id.'@example.com',
            ]);
        });

        TenantModel::where('id', $tenantId)->update([
            'name' => 'Deleted Tenant',
            'settings' => json_encode([]),
        ]);

        activity()
            ->event('data_deleted')
            ->withProperties([
                'deleted_calls' => $deletedCalls,
                'deleted_recordings' => $deletedRecordings,
                'requested_by' => $request->user()->id,
            ])
            ->log('All tenant data deleted per right to be forgotten');

        return response()->json([
            'message' => 'Data deleted successfully',
            'deleted_calls' => $deletedCalls,
            'deleted_recordings' => $deletedRecordings,
        ]);
    }
}
