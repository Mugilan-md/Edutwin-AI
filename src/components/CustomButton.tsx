type CustomButtonProps = {
  title: string;
  onClick?: () => void;
};

function CustomButton({
  title,
  onClick,
}: CustomButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
    >
      {title}
    </button>
  );
}

export default CustomButton;