import { find, split, head } from 'lodash'
import { subjectMatterContexts } from '../constants/constants'

// Gets the subject matter from active context
export const getSubjectMatter = (agent: Agent): SubjectMatter => {
  const subjectMatterContext = find(agent.contexts, context => subjectMatterContexts.includes(context.name))

  return (subjectMatterContext && subjectMatterContext.lifespan && subjectMatterContext.lifespan > 0 ? head(split(subjectMatterContext.name, '-')) : 'general') as SubjectMatter
}