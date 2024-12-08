import OpportunityPageWrapper from './OpportunityPageWrapper';

interface OpportunityPageProps {
  params: {
    id: string;
  };
}

export default function OpportunityPage({ params }: OpportunityPageProps) {
  return <OpportunityPageWrapper params={params} />;
} 