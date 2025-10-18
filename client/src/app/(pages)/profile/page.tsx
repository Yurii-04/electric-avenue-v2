export default function ProfilePage() {
  return (
    <div>
      {new Date().toLocaleTimeString()}
    </div>
  );
}


export const revalidate = 10