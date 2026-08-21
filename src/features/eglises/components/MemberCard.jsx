import { Avatar, RoleBadge } from "../../../components/ui";

export default function MemberCard({ member }) {
  return (
    <div className="card rounded-lg p-4 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <Avatar
        firstName={member.firstName}
        lastName={member.lastName}
        src={member.profile?.avatarUrl}
        size="lg"
        className="ring-2 ring-gold/20 group-hover:ring-gold/40 transition-all"
      />
      <div className="min-w-0">
        <p className="font-semibold truncate">{member.firstName} {member.lastName}</p>
        <RoleBadge role={member.role} className="mt-1.5 inline-block" />
        <p className="text-xs mt-1.5 text-soft truncate">{member.church?.name ?? member.profile?.city ?? ""}</p>
      </div>
    </div>
  );
}