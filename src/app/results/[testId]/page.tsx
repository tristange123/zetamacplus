import ClientSide from './clientSide'

export default async function Results({params}: {params: Promise<{ testId: string }>}){
    const { testId } = await params;
    return (
        <ClientSide testId = {testId} />
    )
}