'use client';

/**
 * JSON-LD Structured Data Components for SEO
 * These add rich snippets to search results
 */

interface OrganizationSchemaProps {
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
}

export function OrganizationSchema({
    name = "UPicks",
    url = "https://upicks.cc",
    logo = "https://upicks.cc/icon.png",
    description = "The anonymous, student-driven professor rating platform for the UP community."
}: OrganizationSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo,
        description,
        sameAs: [],
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            availableLanguage: ["English", "Filipino"]
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface WebsiteSchemaProps {
    name?: string;
    url?: string;
}

export function WebsiteSchema({
    name = "UPicks",
    url = "https://upicks.cc"
}: WebsiteSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${url}/rate?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface ProfessorReviewSchemaProps {
    professorName: string;
    departmentName: string;
    averageRating: number;
    reviewCount: number;
    url: string;
}

export function ProfessorReviewSchema({
    professorName,
    departmentName,
    averageRating,
    reviewCount,
    url
}: ProfessorReviewSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: professorName,
        jobTitle: "Professor",
        worksFor: {
            "@type": "EducationalOrganization",
            name: `University of the Philippines - ${departmentName}`
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            bestRating: "5",
            worstRating: "1",
            ratingCount: reviewCount
        },
        url
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface CampusReviewSchemaProps {
    campusName: string;
    location: string;
    averageRating: number;
    reviewCount: number;
    url: string;
}

export function CampusReviewSchema({
    campusName,
    location,
    averageRating,
    reviewCount,
    url
}: CampusReviewSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: campusName,
        address: {
            "@type": "PostalAddress",
            addressLocality: location,
            addressCountry: "PH"
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            bestRating: "5",
            worstRating: "1",
            ratingCount: reviewCount
        },
        url
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface BreadcrumbSchemaProps {
    items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface FAQSchemaProps {
    questions: { question: string; answer: string }[];
}

export function FAQSchema({ questions }: FAQSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map(q => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: q.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
