import { getSession } from 'next-auth/react';
import requestIp from 'request-ip';

export async function updateUserIp(req, res, next) {
    try {
        const session = await getSession({ req });
        if (session?.user?.id) {
            const ipAddress = requestIp.getClientIp(req);
            
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/ip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    ipAddress
                })
            });
        }
    } catch (error) {
        console.error('Error updating IP:', error);
    }
    next();
} 