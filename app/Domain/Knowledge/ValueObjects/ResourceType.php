<?php

namespace App\Domain\Knowledge\ValueObjects;

enum ResourceType: string
{
    case Pdf = 'pdf';
    case Image = 'image';
    case Csv = 'csv';
    case Text = 'text';
    case Web = 'web';
}
