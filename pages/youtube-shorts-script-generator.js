import ScriptToolPage from '../components/scriptTools/ScriptToolPage';
import { getScriptToolPageProps } from '../lib/scriptTools/config';

export default function Page(props) {
  return <ScriptToolPage {...props} />;
}

export async function getStaticProps() {
  return { props: getScriptToolPageProps('youtube-shorts-script-generator') };
}
