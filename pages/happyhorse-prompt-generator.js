import FreeToolPage from '../components/freeTools/FreeToolPage';
import { getFreeToolPageProps } from '../lib/freeTools/config';

export default function Page(props) {
  return <FreeToolPage {...props} />;
}

export async function getStaticProps() {
  return { props: getFreeToolPageProps('happyhorse-prompt-generator') };
}
