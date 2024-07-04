import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import Select, { ActionMeta, MultiValue } from 'react-select';
import PageLayout from './PageLayout';
import { useNotification } from '../context/NotificationContext';
import { useProtectedApi } from '../hooks/useProtectedApi';

interface Paper {
  code: string;
  name: string;
  level: string;
}

interface SubjectToPapersMap {
  [key: string]: Paper[];
}

interface Review {
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
  const [isLoading, setIsLoading] = useState(false);
  const latestSearchParams = useRef(searchParams);
  const [isSearchPending, setIsSearchPending] = useState(false);

  const subjectOptions: SelectOption[] = Object.keys(papersBySubject).map(subjectName => ({
    value: subjectName,
    label: subjectName
  }));

  const paperOptions: SelectOption[] = selectedSubjectPapers.map(paper => ({
    value: paper.code,
    label: `${paper.code} - ${paper.name}`
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

  const fetchPapersRef = useRef(useProtectedApi<AxiosResponse<SubjectToPapersMap>>(
    () => axios.get<SubjectToPapersMap>(`${baseURL}/api/papers`, { withCredentials: true }),
    'Failed to fetch papers. Please try again.'
  ));

  const fetchCollegesRef = useRef(useProtectedApi<AxiosResponse<SelectOption[]>>(
    () => axios.get<SelectOption[]>(`${baseURL}/api/colleges`, { withCredentials: true }),
    'Failed to fetch colleges. Please try again.'
  ));

  const fetchPapers = useCallback(() => {
    return fetchPapersRef.current();
  }, []);

  const fetchColleges = useCallback(() => {
    return fetchCollegesRef.current();
  }, []);

  useEffect(() => {
    document.title = 'TuteReview - Search reviews';
    const loadData = async () => {
      const papersResponse = await fetchPapers();
      if (papersResponse) setPapersBySubject(papersResponse.data);

      const collegesResponse = await fetchColleges();
      if (collegesResponse) setColleges(collegesResponse.data);
    };
    loadData();
  }, [fetchPapers, fetchColleges]);

  // Hide scrollbar when loading
  useEffect(() => {
    if (isLoading || isSearchPending) {
      // Save original styles
      const originalStyle = {
        scrollbarGutter: document.documentElement.style.getPropertyValue('scrollbar-gutter'),
        overflow: document.documentElement.style.getPropertyValue('overflow'),
      };
      // Apply new styles
      document.documentElement.style.setProperty('scrollbar-gutter', 'unset');
      document.documentElement.style.setProperty('overflow', 'hidden');
      document.body.style.setProperty('padding-right', '0px');
      return () => {
        // Restore original styles when component unmounts or loading state changes
        document.documentElement.style.setProperty('scrollbar-gutter', originalStyle.scrollbarGutter);
        document.documentElement.style.setProperty('overflow', originalStyle.overflow);
        document.body.style.removeProperty('padding-right');
      };
    }
  }, [isLoading, isSearchPending]);

  const fetchResults = useCallback(async () => { // NOTE unecessarily fetches on initial load
    if (areSearchParamsEmpty(latestSearchParams.current)) {
      setResults([]);
      setIsLoading(false);
      setIsSearchPending(false);
      return;
    }
    setIsLoading(true);
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
      setIsLoading(false);
      setIsSearchPending(false);
    }
  }, [showNotification]);

  useEffect(() => {
    latestSearchParams.current = searchParams;
    setIsSearchPending(true);

    const debounceTimer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearchPending(false);
    };
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
        {areSearchParamsEmpty(searchParams) ? (
          <p>Please select some filters to search.</p>
        ) : results.length === 0 && !isLoading && !isSearchPending ? (
          <p>No results found.</p>
        ) : (
          <>
            {Object.entries(groupReviewsByPaperAndTutor(results)).map(([key, groupedReviews]) => {
              const firstReview = groupedReviews[0];
              return (
                <Card key={key} className="mb-4">
                  <Card.Header>
                    <h3>{`${firstReview.responses.paperName} (${firstReview.responses.paperCode}) - ${firstReview.responses.tutor}`}</h3>
                  </Card.Header>
                  <Card.Body>
                    {groupedReviews.map((review, index) => (
                      <Card key={index} className="mb-3">
                        <Card.Body>
                          {review.submittedAt && (
                            <p className="mb-0"><em>Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
                          )}
                          <p><em>College: {collegeLookup.get(review.college) || review.college}</em></p>
                          {Object.entries(review.responses).map(([key, value]) => {
                            if (!['tutor', 'subject', 'paperCode', 'paper', 'paperName', 'submittedAt'].includes(key) && value.trim() !== "") {
                              return (
                                <p key={key} className="mb-2">
                                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                </p>
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
            {(isLoading || isSearchPending) && (
              <div className="loading-overlay">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default SearchPage;