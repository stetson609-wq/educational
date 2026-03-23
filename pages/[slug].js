export async function getServerSideProps({ req, params, res }) {
  const verified = req.cookies._v === process.env.SECRET;
  const isBot = /bot|crawl|spider|scrape/i.test(req.headers['user-agent'] || '');
  
  if (isBot) {
    return { props: { content: '<div>Educational Resource</div>' } };
  }
  
  if (!verified) {
    return { 
      redirect: { 
        destination: '/', 
        permanent: false 
      } 
    };
  }
  
  const content = Buffer.from(process.env.REAL_CONTENT, 'base64').toString();
  return { props: { content, verified: true } };
}

export default function Page({ content, verified }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
