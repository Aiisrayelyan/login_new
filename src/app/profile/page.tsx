import { redirect } from 'next/navigation';
import { verifyAuth } from '../lib/auth';
import { getUserById } from '../lib/api';
import { handleLogout } from '../lib/actions';


export default async function Profile() {
    const result = await verifyAuth();
    if (!result.user) {
        redirect('/login');
    }
    const user = getUserById(result.user.id)
    return (
        <div className="p-5">
            <p className="is-size-3">{user.name} {user.surname}</p>
            <form action={handleLogout}>
                <button className="button is-danger" >logout</button>
            </form>
        </div>
    );
}
