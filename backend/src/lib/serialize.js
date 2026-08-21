// Sérialisation : formes de données exactement attendues par le frontend.
// Aucun mot de passe ne doit sortir de l'API.

/** Inclut le profil et l'église sur un utilisateur. */
export const userInclude = { profile: true, church: true };

/** Retire le hash du mot de passe avant envoi (expose seulement hasPassword). */
export const safeUser = (user) => {
  if (!user) return user;
  const { password: _password, ...rest } = user;
  return { ...rest, hasPassword: Boolean(user.password) };
};

/** Forme utilisateur du frontend : { id, email, firstName, lastName, phone, role, churchId, profile, church }. */
export const toUser = (user) => safeUser(user);

/** Auteur compact (posts, prières, médias, direct) : { firstName, lastName, role }. */
export const toAuthor = (user) => ({
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  role: user?.role ?? null,
});

/** Sérialise un post (liste + détail) tel que lu par les pages Actualités. */
export const toPost = (post) => ({
  ...post,
  author: toAuthor(post.author),
  category: post.category ? { id: post.category.id, name: post.category.name } : null,
  reads: post._count?.reads ?? (post.reads ? post.reads.length : undefined),
});