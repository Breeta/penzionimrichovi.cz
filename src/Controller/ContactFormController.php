<?php

namespace App\Controller;

use App\Entity\ContactForm;
use Doctrine\ORM\EntityManagerInterface;
use Knp\Component\Pager\PaginatorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ContactFormController extends AbstractController
{


    #[Route('/contact/new', name: 'contact_form_new', methods: ['POST'])]
    public function new(Request $request, MailerInterface $mailer, EntityManagerInterface $entityManager, CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        if ($request->isXmlHttpRequest()) {
            $data = $request->request->all();
            $token = new CsrfToken('contact-form', $data['_token']);

            if (!$csrfTokenManager->isTokenValid($token)) {
                return new JsonResponse(['success' => false, 'error' => 'Neplatný CSRF token.'], 400);
            }

            $contactForm = new ContactForm();
            $contactForm->setDateFrom(new \DateTime($data['arrival']));
            $contactForm->setDateTo(new \DateTime($data['departure']));
            $contactForm->setAdult((int)$data['adults']);
            $contactForm->setChild((int)$data['children']);

            $rooms = [];
            if (!empty($data['room_double']) && $data['room_double'] > 0) {
                $rooms[] = 'Dvoulůžkový: ' . $data['room_double'];
            }
            if (!empty($data['room_triple']) && $data['room_triple'] > 0) {
                $rooms[] = 'Třílůžkový: ' . $data['room_triple'];
            }
            if (!empty($data['room_quad']) && $data['room_quad'] > 0) {
                $rooms[] = 'Čtyřlůžkový: ' . $data['room_quad'];
            }
            if (!empty($data['room_apartment']) && $data['room_apartment'] > 0) {
                $rooms[] = 'Apartmán: ' . $data['room_apartment'];
            }
            $contactForm->setRoom(implode(', ', $rooms));

            $contactForm->setName($data['name']);
            $contactForm->setCity($data['city']);
            $contactForm->setPhone($data['phone']);
            $contactForm->setEmail($data['email']);
            $contactForm->setInfo($data['notes']);

            $entityManager->persist($contactForm);
            $entityManager->flush();

             $email = (new Email())
                 ->from('info@penzionimrichovi.cz')
                 ->to('info@penzionimrichovi.cz')
                 ->subject('Nová poptávka ubytování')
                 ->html($this->renderView('emails/contact_form.html.twig', ['data' => $data]));
             $mailer->send($email);

            return new JsonResponse(['success' => true]);
        }

        return new JsonResponse(['success' => false], 400);
    }

    #[isGranted('ROLE_ADMIN')]
    #[Route('/admin/contact-form/', name: 'contact_form_index', methods: ['GET'])]
    public function index(EntityManagerInterface $em,   PaginatorInterface $paginator, Request $request): Response
    {

        $dql = "SELECT cf FROM App\Entity\ContactForm cf ORDER BY cf.id DESC";
        $query = $em->createQuery($dql);

        $pagination = $paginator->paginate(
            $query, /* query NOT result */
            $request->query->getInt('page', 1), /* page number */
            10 /* limit per page */
        );

        return $this->render('contact_form/index.html.twig', [
            'contact_forms' => $pagination,
        ]);
    }

    #[isGranted('ROLE_ADMIN')]
    #[Route('/admin/contact-form/{id}', name: 'contact_form_delete', methods: ['POST'])]
    public function delete(Request $request, ContactForm $contactForm, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$contactForm->getId(), $request->request->get('_token'))) {
            $entityManager->remove($contactForm);
            $entityManager->flush();
        }

        return $this->redirectToRoute('contact_form_index', [], Response::HTTP_SEE_OTHER);
    }
}
