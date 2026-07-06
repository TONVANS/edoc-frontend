import UserListView from '@/components/views/users/UserListView';

export const metadata = {
  title: 'Users | E-Document Management',
  description: 'Manage system users and access roles.',
};

export default function UsersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-full font-lao">
      <UserListView />
    </div>
  );
}
