import clsx from "clsx";
import React, { ReactNode } from "react";
import { capitalizeFirstLetter } from "../utils/capitalizeFirstLetter";

type Props = {
  type?: "button" | "submit" | "reset";
  children?: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
};

const Button = ({
  type = "button",
  children = capitalizeFirstLetter(type),
  fullWidth,
  onClick,
  secondary,
  danger,
  disabled = false,
}: Props) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={clsx(
        `
      flex
      justify-center
      rounded-md
      shadow-sm
      px-5
      py-2
      font-semibold
      focus-visible:outline
      focus-visible:outline-2
      focus-visible:outline-blue-400
      focus-visible:outline-offset-2
     text-slate-100
      hover:outline-blue-400
      hover:outline-offset-2
      hover:bg-opacity-90
      `,
        disabled && "opacity-50 cursor-default",
        fullWidth && "w-full",
        danger ? "bg-rose-500/90" : secondary ? " bg-slate-500" : "bg-blue-500"
      )}
    >
      {children}
    </button>
  );
};

export default Button;
