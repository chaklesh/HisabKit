import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../mdx-components.jsx";

export const generateStaticParams = generateStaticParamsFor('mdxPath');

export async function generateMetadata(props) {
  const params = await props.params;
  const mdxPath = params?.mdxPath || [];
  try {
    const { metadata } = await importPage(mdxPath);
    return metadata;
  } catch (err) {
    return { title: 'Not Found' };
  }
}

export default async function Page(props) {
  const params = await props.params;
  const mdxPath = params?.mdxPath || [];
  const Wrapper = getMDXComponents().wrapper;

  try {
    const { default: MDXContent, toc, metadata } = await importPage(mdxPath);
    return (
      <Wrapper toc={toc} metadata={metadata}>
        <MDXContent {...props} params={params} />
      </Wrapper>
    );
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Document not found</h1>
        <p className="text-slate-500 mt-2">The requested page could not be located in the documentation catalog.</p>
      </div>
    );
  }
}
