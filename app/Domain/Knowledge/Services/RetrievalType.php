<?php

namespace App\Domain\Knowledge\Services;

enum RetrievalType: string
{
    case Semantic = 'semantic';
    case Summary = 'summary';
}
