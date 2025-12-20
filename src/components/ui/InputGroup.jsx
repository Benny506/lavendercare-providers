export default function InputGroup({ className, label, icon: Icon, children }) {
  return (
    <div className={`${className} space-y-1.5`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon size={14} className="text-gray-400" />}
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
