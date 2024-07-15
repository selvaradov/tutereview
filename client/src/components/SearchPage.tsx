import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, Alert } from 'react-bootstrap';
import Select, { ActionMeta, MultiValue } from 'react-select';
import PageLayout from './PageLayout';
import { useNotification } from '../context/NotificationContext';
import { useLoading } from '../context/LoadingContext';
import ReviewCard from './ReviewCard';
import ReviewSummary from './ReviewSummary';
import { MissingOptionsMessage } from './Messages';
import { Paper, SubjectToPapersMap, Review, SearchParams, SearchResults, Option, GroupedReviews } from '../types';

const SearchPage: React.FC = () => {
  const [papersBySubject, setPapersBySubject] = useState<SubjectToPapersMap>({});
  const [selectedSubject, setSelectedSubject] = useState<Option | null>(null);
  const [selectedSubjectPapers, setSelectedSubjectPapers] = useState<Paper[]>([]);
  const [colleges, setColleges] = useState<Option[]>([]);
  const [collegeFilterApplied, setCollegeFilterApplied] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tutor: '',
    subject: '',
    paper: [],
    college: []
  });
  const [results, setResults] = useState<Review[]>([]);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const latestSearchParams = useRef(searchParams);
  const [groupedReviews, setGroupedReviews] = useState<GroupedReviews>({});

  const subjectOptions: Option[] = Object.keys(papersBySubject).map(subjectName => ({
    value: subjectName,
    label: subjectName
  }));

  const paperOptions: Option[] = selectedSubjectPapers.map(paper => ({
    value: paper.code,
    label: `${paper.code} - ${paper.name} (${paper.level})`
  }));

  const memoizedCollegeOptions = useMemo(() =>
    searchParams.college.map(value => colleges.find(c => c.value === value)).filter(Boolean) as Option[],
    [searchParams.college, colleges]
  );

  const memoizedPaperOptions = useMemo(() =>
    searchParams.paper.map(value => paperOptions.find(p => p.value === value)).filter(Boolean) as Option[],
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
        const [papersResponse, collegesResponse] = await Promise.all([
          axios.get<SubjectToPapersMap>('/api/papers', { withCredentials: true }),
          axios.get<Option[]>('/api/colleges', { withCredentials: true })
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
      setCollegeFilterApplied(false);
      return;
    }
    startLoading();
    try {
      const response = await axios.get<SearchResults>('/api/search', {
        params: latestSearchParams.current,
        withCredentials: true,
      });
      setResults(response.data.reviews);
      setCollegeFilterApplied(response.data.collegeFilterApplied);
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

  const handleSubjectChange = (selectedOption: Option | null) => {
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
    selectedOptions: MultiValue<Option> | null,
    actionMeta: ActionMeta<Option>
  ) => {
    setSearchParams(prev => ({
      ...prev,
      // Map over selectedOptions only if it's not null, otherwise set to an empty array
      paper: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  const handleCollegeChange = (
    selectedOptions: MultiValue<Option> | null,
    actionMeta: ActionMeta<Option>
  ) => {
    setSearchParams(prev => ({
      ...prev,
      college: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  useEffect(() => {
    if (results.length > 0) {
      const grouped = results.reduce((acc, review) => {
        const key = `${review.responses.paperCode}-${review.responses.tutor}`;
        if (!acc[key]) {
          acc[key] = { reviews: [], showFullResults: false, colleges: review.college };
        }
        acc[key].reviews.push(review);
        return acc;
      }, {} as GroupedReviews);
      setGroupedReviews(grouped);
    } else {
      setGroupedReviews({});
    }
  }, [results]);

  const handleToggleFullResults = (key: string) => {
    setGroupedReviews(prev => ({
      ...prev,
      [key]: { ...prev[key], showFullResults: !prev[key].showFullResults }
    }));
  };


  return (
    <PageLayout title="Search reviews">
      <MissingOptionsMessage />
      <Form>
        <Row>
          <Col md={6} className="mb-3">
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
          <Col md={6} className="mb-3">
            <Form.Group controlId="college">
              <Form.Label className='fw-bold'>College:</Form.Label>
              <Select<Option, true>
                value={memoizedCollegeOptions}
                onChange={handleCollegeChange}
                options={colleges}
                isClearable
                isMulti
                placeholder="Select colleges"
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group controlId="subject">
              <Form.Label className='fw-bold'>Subject:</Form.Label>
              <Select<Option>
                value={selectedSubject}
                onChange={handleSubjectChange}
                options={subjectOptions}
                isClearable
                placeholder="Select a subject"
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group controlId="paper">
              <Form.Label className='fw-bold'>Paper:</Form.Label>
              <Select<Option, true>
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
      {collegeFilterApplied && (
          <Alert variant="info" className="mb-3">
            Note: When filtering by college, only tutor-paper combinations with at least three recent submissions from the college(s) in question are shown.
          </Alert>
        )}
        {areSearchParamsEmpty(latestSearchParams.current) ? (
          <p>Please select some filters to search.</p>
        ) : Object.keys(groupedReviews).length === 0 && !isLoading ? (
          <p>No results found.</p>
        ) : (
          <>
            <p>
              You can now see how other students found their tutorials, including how helpful the
              tutor's answers to their questions were, whether the tutor had looked at their work
              before the tutorial, how tutorials were structured, and the type of feedback they received.
            </p>
            {Object.entries(groupedReviews).map(([key, { reviews, showFullResults, colleges }]) => {
              const firstReview = reviews[0];
              return (
                <Card key={key} className="mb-4">
                  <Card.Header>
                    <h3>{`${firstReview.responses.paperName} (${firstReview.responses.paperLevel}) - ${firstReview.responses.tutor}`}</h3>
                  </Card.Header>
                  <Card.Body>
                    <ReviewSummary
                      reviews={reviews}
                      onToggleFullResults={() => handleToggleFullResults(key)}
                      showFullResults={showFullResults}
                      colleges={colleges}
                      collegeLookup={collegeLookup}
                    />
                    {showFullResults && reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                      />
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