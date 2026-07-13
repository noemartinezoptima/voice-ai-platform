<?php

namespace App\Http\Controllers\Web;

use App\Infrastructure\Persistence\Eloquent\Flow\FlowCommentModel;
use App\Infrastructure\Persistence\Eloquent\Flow\FlowModel;
use App\Infrastructure\Persistence\Eloquent\UserNotificationModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlowCommentController
{
    public function index(Request $request, string $flow): JsonResponse
    {
        $flowModel = FlowModel::where('id', $flow)
            ->where('tenant_id', $request->user()->tenant_id)
            ->firstOrFail();

        $comments = FlowCommentModel::query()
            ->where('flow_id', $flowModel->id)
            ->where('tenant_id', $request->user()->tenant_id)
            ->whereNull('parent_id')
            ->with(['user:id,name,email', 'replies.user:id,name,email'])
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function store(Request $request, string $flow): JsonResponse
    {
        $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'string', 'uuid'],
        ]);

        $flowModel = FlowModel::where('id', $flow)
            ->where('tenant_id', $request->user()->tenant_id)
            ->firstOrFail();

        $comment = FlowCommentModel::create([
            'flow_id' => $flowModel->id,
            'tenant_id' => $request->user()->tenant_id,
            'user_id' => $request->user()->id,
            'body' => $request->body,
            'parent_id' => $request->parent_id,
        ]);

        $comment->load('user:id,name,email');

        if ($request->parent_id) {
            $comment->load('parent.user:id,name,email');

            $parentAuthor = $comment->parent?->user;
            if ($parentAuthor !== null && $parentAuthor->id !== $request->user()->id) {
                UserNotificationModel::send(
                    $parentAuthor->id,
                    'comment',
                    "{$request->user()->name} replied to your comment",
                    "Flow: {$flowModel->name}",
                    ['flow_id' => $flowModel->id, 'comment_id' => $comment->id],
                );
            }
        }

        return response()->json($comment, 201);
    }
}
