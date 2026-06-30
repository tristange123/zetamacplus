import ClientSide from './clientSide';
import {type ReactNode} from 'react' 
import prisma from '@/lib/db/prisma'
import {type ProblemDb, type TestDb} from '@/types/dbTypes'

type ResultsProps  = {
  children : ReactNode
  params: Promise<{ testId: string }> 
}

export default async function MainPage({children, params}: ResultsProps){
  try{
    const {testId} = await params;
    const problemList:ProblemDb[] = await prisma.problem.findMany({
      where: {testId}
    });
    const test: TestDb[] = await prisma.test.findMany({
      where: {id: testId}
    });
    if (test.length == 0){
      return <div> Error </div>
    }


    return <ClientSide problemList = {problemList} score = {(test[0]).score}></ClientSide>
  }
  catch(err){
    return <div>Frontend Error</div>
  }
  
}