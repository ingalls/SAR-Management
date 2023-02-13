export default function(Permissions, auth, permission)  {
    // Admins will be admins

    if (auth && auth.access && auth.access === 'admin') return true;

    const iam = permission.split(':');

    if (
        auth.iam
        && iam.length === 2
        && auth.iam[iam[0]]
        && Permissions[iam[0]].indexOf(iam[1]) <= Permissions[iam[0]].indexOf(auth.iam[iam[0]])
    ) {
        return true;
    }

    return false;
}
