import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

// Memoized form content to prevent unnecessary re-renders
const LoginFormContent = memo(function LoginFormContent({
    processing,
    errors,
    canResetPassword,
}: {
    processing: boolean;
    errors: Record<string, string>;
    canResetPassword: boolean;
}) {
    return (
        <>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                        {canResetPassword && (
                            <TextLink
                                href={request()}
                                className="ml-auto text-sm"
                                tabIndex={5}
                            >
                                Forgot password?
                            </TextLink>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        name="remember"
                        tabIndex={3}
                    />
                    <Label htmlFor="remember">Remember me</Label>
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full"
                    tabIndex={4}
                    disabled={processing}
                    data-test="login-button"
                >
                    {processing && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    Log in
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <TextLink href={register()} tabIndex={5}>
                    Sign up
                </TextLink>
            </div>
        </>
    );
});

export default function Login({ status, canResetPassword }: LoginProps) {
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState(false);

    // Client-side validation for faster feedback
    const validateForm = useCallback((formData: FormData) => {
        const errors: Record<string, string> = {};
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Email validation
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 1) {
            errors.password = 'Password is required';
        }

        setClientErrors(errors);
        return Object.keys(errors).length === 0;
    }, []);

    // Optimized form submission with client-side validation
    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        
        // Quick client-side validation
        setIsValidating(true);
        const isValid = validateForm(formData);
        setIsValidating(false);

        if (!isValid) {
            e.preventDefault();
        }
    }, [validateForm]);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...AuthenticatedSessionController.store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
                onSubmit={handleSubmit}
            >
                {({ processing, errors }) => {
                    // Merge client-side and server-side errors
                    const mergedErrors = { ...clientErrors, ...errors };

                    return (
                        <LoginFormContent
                            processing={processing || isValidating}
                            errors={mergedErrors}
                            canResetPassword={canResetPassword}
                        />
                    );
                }}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
