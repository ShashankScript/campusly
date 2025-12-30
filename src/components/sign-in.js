"use client"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export default function SignIn() {
    return (
        <Button
            onClick={async () => {
                await signIn.social({
                    provider: "google",
                    callbackURL: "/dashboard"
                })
            }}
        >
            Sign in with Google
        </Button>
    )
}
