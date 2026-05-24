import { redirect } from "next/navigation";

// Onboarding foi movido para dentro do módulo RH
export default function OnboardingRedirect() {
  redirect("/rh/onboarding");
}
