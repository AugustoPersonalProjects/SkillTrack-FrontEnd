import EmailForm from "../components/profile/EmailForm";
import PasswordForm from "../components/profile/PasswordForm";
import ProfileForm from "../components/profile/ProfileForm";
import ThemeForm from "../components/profile/ThemeForm";
import PageHeader from "../components/ui/PageHeader";

export default function Profile() {
  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" description="Personalize sua conta e mantenha seus dados de acesso em dia." />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <ProfileForm />
          <ThemeForm />
        </div>
        <div className="space-y-6">
          <EmailForm />
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
