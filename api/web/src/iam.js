export default function(Permissions, auth, permission)  {
    // Admins will be admins

    if (auth && auth.access && auth.access === 'admin') return true;

    const iam = permission.split(':');

    // WebUI is misconfigured
    if (!auth.iam || iam.length !== 2) return false;

    const group = Permissions[iam[0]];

    // IAM Group specified does not exist in API
    if (!group) return false;

    // User does not have that permission specified
    if (!auth.iam[iam[0]]) return false;

    // Auth Added
    if (group.indexOf(iam[1]) >= group.indexOf(auth.iam[iam[0]])) return true;

    return false;
}
