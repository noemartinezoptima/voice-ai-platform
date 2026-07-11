import { Button } from '@/Components/catalyst/button';
import { Plug } from 'lucide-react';

export default function ConnectTwilioButton({ href, disabled }) {
    return (
        <Button outline href={href} disabled={disabled}>
            <Plug className="size-4" />
            Connect Twilio Account
        </Button>
    );
}
