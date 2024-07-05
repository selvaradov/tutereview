import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, ListGroup, Table } from 'react-bootstrap';
import Select, { ActionMeta, MultiValue } from 'react-select';
import PageLayout from './PageLayout';
import { useNotification } from '../context/NotificationContext';
import { useLoading } from '../context/LoadingContext';

interface Paper {
  code: string;
  name: string;
  level: string;
}

interface SubjectToPapersMap {
  [key: string]: Paper[];
}

interface Review {
  _id: string;
  responses: {
    tutor: string;
    subject: string;
    paperCode: string;
    paperName: string;
    [key: string]: string;
  };
  submittedAt: string;
  college: string;
}

interface SearchParams {
  tutor: string;
  subject: string;
  paper: string[];
  college: string[];
}

interface SelectOption {
  value: string;
  label: string;
}

const questionTitles: { [key: string]: string } = {
  pre_tutorial: "Pre-Tutorial Work Review",
  feedback_timely: "Feedback Timeliness",
  rating_feedback: "Feedback Rating",
  tutorial_length: "Tutorial Length",
  tutorial_structure: "Tutorial Structure",
  tutorial_explanations: "Tutorial Explanations",
  rating_tutorial: "Tutorial Rating",
  rating_overall: "Overall Rating",
  comments: "Additional Comments",
  feedback_written: "Written Feedback",
  feedback_verbal: "Verbal Feedback",
};

interface QuestionOptions {
  [key: string]: {
    [key: string]: string;
  };
}

const questionOptions: QuestionOptions = {
  feedback_written: {
    "comments on specific sections": "💬 Yes - I got comments on specific sections",
    "overall comment for the whole submission": "📝 Yes - I got an overall comment for the whole submission",
    "grade / numerical mark": "🔢 Yes - I got a grade / numerical mark"
  }
};

const displayOrder = [
  "rating_overall",
  "rating_tutorial",
  "tutorial_explanations",
  "pre_tutorial",
  "tutorial_length",
  "tutorial_structure",
  "rating_feedback",
  "feedback_written",
  "feedback_verbal",
  "feedback_timely",
  "comments"
];

const baseURL = process.env.REACT_APP_API_URL;

const SearchPage: React.FC = () => {
  const [papersBySubject, setPapersBySubject] = useState<SubjectToPapersMap>({});
  const [selectedSubject, setSelectedSubject] = useState<SelectOption | null>(null);
  const [selectedSubjectPapers, setSelectedSubjectPapers] = useState<Paper[]>([]);
  const [colleges, setColleges] = useState<SelectOption[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tutor: '',
    subject: '',
    paper: [],
    college: []
  });
  const [results, setResults] = useState<Review[]>([]);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const latestSearchParams = useRef(searchParams);

  const subjectOptions: SelectOption[] = Object.keys(papersBySubject).map(subjectName => ({
    value: subjectName,
    label: subjectName
  }));

  const paperOptions: SelectOption[] = selectedSubjectPapers.map(paper => ({
    value: paper.code,
    label: `${paper.code} - ${paper.name} (${paper.level})`
  }));

  const memoizedCollegeOptions = useMemo(() =>
    searchParams.college.map(value => colleges.find(c => c.value === value)).filter(Boolean) as SelectOption[],
    [searchParams.college, colleges]
  );

  const memoizedPaperOptions = useMemo(() =>
    searchParams.paper.map(value => paperOptions.find(p => p.value === value)).filter(Boolean) as SelectOption[],
    [searchParams.paper, paperOptions]
  );

  const collegeLookup = useMemo(() => {
    return new Map(colleges.map(college => [college.value, college.label]));
  }, [colleges]);

  const areSearchParamsEmpty = (params: SearchParams): boolean => {
    const { tutor, subject, paper, college } = params;
    return tutor === '' && subject === '' && paper.length === 0 && college.length === 0;
  };

  const { showNotification } = useNotification();

  useEffect(() => {
    document.title = 'TuteReview - Search reviews';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
      try {
        const papersUrl = `${baseURL}/api/papers`;
        const collegesUrl = `${baseURL}/api/colleges`;

        const [papersResponse, collegesResponse] = await Promise.all([
          axios.get<SubjectToPapersMap>(papersUrl, { withCredentials: true }),
          axios.get<SelectOption[]>(collegesUrl, { withCredentials: true })
        ]);

        setPapersBySubject(papersResponse.data);
        setColleges(collegesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('Failed to load form data. Please try again.', 'error');
      } finally {
        stopLoading();
      }
    };

    fetchData();
  }, [showNotification, startLoading, stopLoading]);

  const fetchResults = useCallback(async () => {
    if (areSearchParamsEmpty(latestSearchParams.current)) {
      setResults([]);
      return;
    }
    startLoading();
    try {
      const response = await axios.get<Review[]>(`${baseURL}/api/search`, {
        params: latestSearchParams.current,
        withCredentials: true,
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      showNotification('Failed to fetch results. Please try again.', 'error');
    } finally {
      stopLoading();
    }
  }, [showNotification, startLoading, stopLoading]);

  useEffect(() => {
    latestSearchParams.current = searchParams;
    fetchResults();
  }, [searchParams, fetchResults]);

  const handleSubjectChange = (selectedOption: SelectOption | null) => {
    setSelectedSubject(selectedOption);
    if (selectedOption) {
      setSelectedSubjectPapers(papersBySubject[selectedOption.value] || []);
      setSearchParams(prev => ({ ...prev, subject: selectedOption.value, paper: [] }));
    } else {
      setSelectedSubjectPapers([]);
      setSearchParams(prev => ({ ...prev, subject: '', paper: [] }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePaperChange = (
    selectedOptions: MultiValue<SelectOption> | null,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    setSearchParams(prev => ({
      ...prev,
      // Map over selectedOptions only if it's not null, otherwise set to an empty array
      paper: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleCollegeChange = (
    selectedOptions: MultiValue<SelectOption> | null,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    setSearchParams(prev => ({
      ...prev,
      college: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const groupReviewsByPaperAndTutor = (reviews: Review[]): Record<string, Review[]> => {
    return reviews.reduce((acc, review) => {
      const key = `${review.responses.paperCode}-${review.responses.tutor}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(review);
      return acc;
    }, {} as Record<string, Review[]>);
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <span>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{color: i < rating ? "#ffc107" : "#e4e5e9"}}>★</span>
        ))}
      </span>
    );
  };

  const renderValue = (key: string, value: string | number | Array<string>) => {
    if (Array.isArray(value) && questionOptions[key]) {
      return <ScoreCard options={questionOptions[key]} selectedOptions={value} />;
    } else if (Array.isArray(value)) {
      return (
        <ListGroup>
          {value.map((item, index) => (
            <ListGroup.Item key={index}>{item}</ListGroup.Item>
          ))}
        </ListGroup>
      );
    } else if (typeof value === 'number' && ['rating_feedback', 'rating_tutorial', 'rating_overall'].includes(key)) {
      return <StarRating rating={value} />;
    } else {
      return value;
    }
  };

  const ScoreCard: React.FC<{ options: { [key: string]: string }, selectedOptions: string[] }> = ({ options, selectedOptions }) => {
    return (
      <Table striped bordered hover size="sm">
        <tbody>
          {Object.entries(options).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td className="text-center">
                {selectedOptions.includes(value) ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <PageLayout title="Search reviews">
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="tutor">
              <Form.Label className='fw-bold'>Tutor's name:</Form.Label>
              <Form.Control
                type="text"
                name="tutor"
                value={searchParams.tutor}
                onChange={handleInputChange}
                placeholder="Start typing..."
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="college">
              <Form.Label className='fw-bold'>College:</Form.Label>
              <Select<SelectOption, true>
                value={memoizedCollegeOptions}
                onChange={handleCollegeChange}
                options={colleges}
                isClearable
                isMulti
                placeholder="Select colleges"
              />
            </Form.Group>
          </Col>
          </Row>
          <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="subject">
              <Form.Label className='fw-bold'>Subject:</Form.Label>
              <Select<SelectOption>
                value={selectedSubject}
                onChange={handleSubjectChange}
                options={subjectOptions}
                isClearable
                placeholder="Select a subject"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="paper">
              <Form.Label className='fw-bold'>Paper:</Form.Label>
              <Select<SelectOption, true>
                value={memoizedPaperOptions}
                onChange={handlePaperChange}
                options={paperOptions}
                isClearable
                isDisabled={!selectedSubject}
                placeholder={selectedSubject ? "Select papers" : "Choose subject first"}
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <div id="results" className="mt-4">
      {areSearchParamsEmpty(latestSearchParams.current) ? (
        <p>Please select some filters to search.</p>
      ) : results.length === 0 && !isLoading ? (
        <p>No results found.</p>
      ) : (
        <>
        <p>
          You can now see how other students found their tutorials, including how helpful the 
          tutor's answers to their questions were  ("<em>Tutorial Explanations</em>")
          whether the tutor had looked at their work
          before the tutorial ("<em>Pre-Tutorial Work Review</em>"), how tutorials were structured,
          and the type of feedback they received. 
        </p>
          {Object.entries(groupReviewsByPaperAndTutor(results)).map(([key, groupedReviews]) => {
            const firstReview = groupedReviews[0];
            return (
              <Card key={key} className="mb-4">
                <Card.Header>
                  <h3>{`${firstReview.responses.paperName} - ${firstReview.responses.tutor}`}</h3>
                </Card.Header>
                <Card.Body>
                  {groupedReviews.map((review) => (
                    <Card key={review._id} className="mb-3">
                      <Card.Body>
                        {review.submittedAt && (
                          <p className="mb-0"><em>Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
                        )}
                        <p><em>College: {collegeLookup.get(review.college) || review.college}</em></p>
                        {displayOrder.map((key) => {
                          const value = review.responses[key];
                          if (value !== undefined && value !== "") { 
                            return (
                              <div key={key} className="mb-2">
                                <strong>{questionTitles[key] || key.charAt(0).toUpperCase() + key.slice(1)}: </strong>
                                {renderValue(key, value)}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </Card.Body>
                    </Card>
                  ))}
                </Card.Body>
              </Card>
            );
          })}
        </>
      )}
    </div>
    </PageLayout>
  );
};

export default SearchPage;