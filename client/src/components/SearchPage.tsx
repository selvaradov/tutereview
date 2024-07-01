import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import Select, { ActionMeta, MultiValue } from 'react-select';
import PageLayout from './PageLayout';

interface Paper {
  code: number;
  name: string;
  level: string;
}

interface SubjectsData {
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
}

interface SearchParams {
  tutor: string;
  subject: string;
  paper: string[];
}

const baseURL = process.env.REACT_APP_API_URL;

const SearchPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectsData>({});
  const [selectedSubject, setSelectedSubject] = useState<{ value: string; label: string } | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    tutor: '',
    subject: '',
    paper: [],
  });
  const [results, setResults] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const latestSearchParams = useRef(searchParams);
  const [isSearchPending, setIsSearchPending] = useState(false);

  const areSearchParamsEmpty = (params: SearchParams): boolean => {
    const { tutor, subject, paper } = params;
    return tutor === '' && subject === '' && paper.length === 0;
  };

  useEffect(() => {
    document.title = 'TuteReview - Search reviews';
    fetchSubjects();
  }, []);

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
      console.error('Error searching reviews:', error);
    } finally {
      setIsLoading(false);
      setIsSearchPending(false);
    }
  }, []);

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

const fetchSubjects = async () => {
  try {
    const response = await axios.get<SubjectsData>(`${baseURL}/api/subjects`, { withCredentials: true });
    setSubjects(response.data);
  } catch (error) {
    console.error('Error fetching subjects:', error);
  }
};

const handleSubjectChange = (selectedOption: { value: string; label: string } | null) => {
  setSelectedSubject(selectedOption);
  if (selectedOption) {
    setPapers(subjects[selectedOption.value] || []);
    setSearchParams(prev => ({ ...prev, subject: selectedOption.value, paper: [] }));
  } else {
    setPapers([]);
    setSearchParams(prev => ({ ...prev, subject: '', paper: [] }));
  }
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setSearchParams(prev => ({ ...prev, [name]: value }));
};

const handlePaperChange = (
  selectedOptions: MultiValue<{ value: string; label: string }> | null,
  actionMeta: ActionMeta<{ value: string; label: string }>
) => {
  setSearchParams(prev => ({
    ...prev,
    // Map over selectedOptions only if it's not null, otherwise set to an empty array
    paper: selectedOptions ? selectedOptions.map(option => option.value) : []
  }));
};

const subjectOptions = Object.keys(subjects).map(subjectName => ({
  value: subjectName,
  label: subjectName
}));

const paperOptions = papers.map(paper => ({
  value: paper.code.toString(),
  label: `${paper.code} - ${paper.name}`
}));

return (
  <PageLayout title="Search Reviews">
    <Form>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="tutor">
            <Form.Label>Tutor's Name:</Form.Label>
            <Form.Control
              type="text"
              name="tutor"
              value={searchParams.tutor}
              onChange={handleInputChange}
              placeholder="Start typing..."
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="subject">
            <Form.Label>Subject:</Form.Label>
            <Select
              value={selectedSubject}
              onChange={handleSubjectChange}
              options={subjectOptions}
              isClearable
              placeholder="Select a subject"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="paper">
            <Form.Label>Paper:</Form.Label>
            <Select
              value={paperOptions.filter(option => searchParams.paper.includes(option.value))}
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
          {results.map((review, index) => (
            <div key={index} className="review-entry mb-4">
              <h3>{`${review.responses.paperName} (${review.responses.paperCode}) - ${review.responses.tutor}`}</h3>
              {review.submittedAt && (
                <p><em>Submitted: {new Date(review.submittedAt).toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
              )}
              {Object.entries(review.responses).map(([key, value]) => {
                if (!['tutor', 'subject', 'paperCode', 'paperName', 'submittedAt'].includes(key) && value.trim() !== "") {
                  return (
                    <p key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          ))}
          {(isLoading || isSearchPending) && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
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