import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Subheading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Field, Label, ErrorMessage } from '@/Components/catalyst/fieldset';
import { Input } from '@/Components/catalyst/input';
import { Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions } from '@/Components/catalyst/dialog';
import { destroy as profileDestroy } from '@/routes/profile';

export default function DeleteUserForm({ className = '' }) {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(profileDestroy().url, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <Subheading>Delete Account</Subheading>
                <Text className="mt-1">
                    Once your account is deleted, all of its resources and data will be
                    permanently deleted. Before deleting your account, please download any
                    data or information that you wish to retain.
                </Text>
            </header>

            <Button color="red" onClick={() => setConfirming(true)}>
                Delete Account
            </Button>

            <Dialog open={confirming} onClose={closeModal}>
                <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                <DialogDescription>
                    Once your account is deleted, all of its resources and data will be
                    permanently deleted. Please enter your password to confirm.
                </DialogDescription>
                <DialogBody>
                    <form onSubmit={deleteUser} id="delete-user-form">
                        <Field>
                            <Label className="sr-only">Password</Label>
                            <Input
                                ref={passwordInput}
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoFocus
                                placeholder="Password"
                                invalid={errors.password ? true : undefined}
                            />
                            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                        </Field>
                    </form>
                </DialogBody>
                <DialogActions>
                    <Button plain onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button type="submit" form="delete-user-form" color="red" disabled={processing}>
                        {processing ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </DialogActions>
            </Dialog>
        </section>
    );
}
