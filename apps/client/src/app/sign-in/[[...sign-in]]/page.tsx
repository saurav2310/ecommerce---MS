import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className="flex items-cetner justify-center mt-16">
            <SignIn />
        </div>

    )
}