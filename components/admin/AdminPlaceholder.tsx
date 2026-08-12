type AdminPlaceholderProps = {
  title: string;
};

const AdminPlaceholder = ({ title }: AdminPlaceholderProps) => (
  <div className="p-4 md:p-8">
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-2">We&apos;ll build this section next.</p>
    </div>
  </div>
);

export default AdminPlaceholder;
