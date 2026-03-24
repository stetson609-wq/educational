export function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || '';
  const referer = request.headers.get('referer') || '';
  
  // Extension/proxy patterns
  const blockPatterns = [
    'goguardian', 'securely', 'blocksi', 'lightspeed',
    'umbrella', 'zscaler', 'forcepoint', 'iboss',
    'crawler', 'bot', 'scraper', 'headless'
  ];
  
  const isBlocked = blockPatterns.some(p => 
    ua.toLowerCase().includes(p) || 
    referer.toLowerCase().includes(p)
  );
  
  // Session verification via cookie
  const verified = request.cookies.get('_v')?.value === process.env.SECRET;
  
  if (isBlocked && !verified) {
    return new Response(null, { 
      status: 302, 
      headers: { 'Location': '/decoy' }
    });
  }
  
  if (!verified && !isBlocked) {
    const response = NextResponse.next();
    response.cookies.set('_pending', '1', { maxAge: 300, httpOnly: true });
    return response;
  }
  
  return NextResponse.next();
}

export const config = { matcher: '/((?!api|_next|decoy).*)' };
