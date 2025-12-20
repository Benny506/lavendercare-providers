// components/ui/Card.jsx
export default function Card({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {(title || subtitle) && (
        <div className="flex items-start gap-3 mb-6">
          {Icon && (
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <Icon size={20} />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
