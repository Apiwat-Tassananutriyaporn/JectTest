import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

type FieldProps = {
  children: ReactNode;
  label: string;
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
  label: string;
};

export function Field({ children, label }: FieldProps) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

export function TextField({ label, ...props }: TextFieldProps) {
  return (
    <Field label={label}>
      <input {...props} />
    </Field>
  );
}

export function SelectField({ children, label, ...props }: SelectFieldProps) {
  return (
    <Field label={label}>
      <select {...props}>{children}</select>
    </Field>
  );
}
