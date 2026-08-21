import { Input } from "./Input";

/**
 * Wrapper de champ pour React Hook Form.
 * Usage (Phase 2 — migration des formulaires) :
 *   <FormField label="Titre" name="title" register={register} error={errors.title?.message} />
 * ou avec un enfant custom :
 *   <FormField label="Type" name="type" register={register} error={errors.type?.message}>
 *     <Select {...register("type")}>…</Select>
 *   </FormField>
 */
export default function FormField({
  name,
  label,
  register,
  error,
  children,
  className = "",
  ...inputProps
}) {
  if (children) {
    return (
      <div className={className}>
        {label && (
          <span className="text-xs font-mono block mb-1.5 text-soft">{label}</span>
        )}
        {children}
        {error && <span className="text-xs text-brick mt-1 block">{error}</span>}
      </div>
    );
  }

  return (
    <Input
      label={label}
      name={name}
      error={error}
      className={className}
      {...register(name)}
      {...inputProps}
    />
  );
}