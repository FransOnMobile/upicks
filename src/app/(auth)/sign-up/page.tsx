import SignUpForm from "@/components/auth/signup-form";
import { Message } from "@/components/form-message";
import { FormMessage } from "@/components/form-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  // If there's a global error message (from server redirect), show it?
  // Our client form handles field errors, but global errors might still come via searchParams for now.
  // Ideally we pass it to the form or display it above.

  return (
    <>
      <SignUpForm />
      {/* Simple way to show server errors for now if any redirect back */}
      {/* Simple way to show server errors for now if any redirect back */}
      {searchParams && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-destructive/15 text-destructive border border-destructive/50 p-4 rounded-md">
            <FormMessage message={searchParams} />
          </div>
        </div>
      )}
    </>
  );
}
