const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} p-6 rounded-xl shadow-md text-gray-900`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-900 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;